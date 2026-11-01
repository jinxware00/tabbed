(function (Root, Factory) {
  var Api = Factory();
  if (typeof module !== "undefined" && module.exports) module.exports = Api;
  Root.AboutuZip = Api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var CrcTable = null;

  function MakeCrcTable() {
    var Table = new Uint32Array(256);
    for (var N = 0; N < 256; N++) {
      var C = N;
      for (var K = 0; K < 8; K++) {
        C = (C & 1) ? (0xedb88320 ^ (C >>> 1)) : (C >>> 1);
      }
      Table[N] = C >>> 0;
    }
    return Table;
  }

  function Crc32(Bytes) {
    if (!CrcTable) CrcTable = MakeCrcTable();
    var C = 0xffffffff;
    for (var I = 0; I < Bytes.length; I++) {
      C = CrcTable[(C ^ Bytes[I]) & 0xff] ^ (C >>> 8);
    }
    return (C ^ 0xffffffff) >>> 0;
  }

  function EncodeText(Text) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(Text);
    var Buf = [];
    for (var I = 0; I < Text.length; I++) {
      var Code = Text.charCodeAt(I);
      if (Code < 0x80) Buf.push(Code);
      else if (Code < 0x800) Buf.push(0xc0 | (Code >> 6), 0x80 | (Code & 63));
      else Buf.push(0xe0 | (Code >> 12), 0x80 | ((Code >> 6) & 63), 0x80 | (Code & 63));
    }
    return new Uint8Array(Buf);
  }

  function DataUrlToBytes(DataUrl) {
    if (typeof DataUrl !== "string") return null;
    var Match = /^data:([^;,]*)(;base64)?,(.*)$/i.exec(DataUrl);
    if (!Match) return null;
    var IsBase64 = !!Match[2];
    var Payload = IsBase64 ? atob(Match[3]) : decodeURIComponent(Match[3]);
    if (!IsBase64) return EncodeText(Payload);
    var Bytes = new Uint8Array(Payload.length);
    for (var I = 0; I < Payload.length; I++) Bytes[I] = Payload.charCodeAt(I);
    return Bytes;
  }

  function DeflateRaw(Bytes) {
    if (typeof CompressionStream === "undefined") return Promise.resolve(null);
    try {
      var Stream = new Blob([Bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
      return new Response(Stream).arrayBuffer().then(function (Buffer) {
        return new Uint8Array(Buffer);
      }).catch(function () { return null; });
    } catch (Err) {
      return Promise.resolve(null);
    }
  }

  function ToBytes(Value) {
    if (Value instanceof Uint8Array) return Promise.resolve(Value);
    if (typeof Value === "string") return Promise.resolve(EncodeText(Value));
    if (Value instanceof ArrayBuffer) return Promise.resolve(new Uint8Array(Value));
    if (typeof Blob !== "undefined" && Value instanceof Blob) {
      return Value.arrayBuffer().then(function (B) { return new Uint8Array(B); });
    }
    return Promise.resolve(new Uint8Array(0));
  }

  function WriteUint16(View, Offset, Value) {
    View.setUint16(Offset, Value & 0xffff, true);
  }

  function WriteUint32(View, Offset, Value) {
    View.setUint32(Offset, Value >>> 0, true);
  }

  function DosDateTime(Date) {
    var Year = Date.getFullYear();
    if (Year < 1980) Year = 1980;
    var Time = (Date.getHours() << 11) | (Date.getMinutes() << 5) | (Date.getSeconds() >> 1);
    var Day = ((Year - 1980) << 9) | ((Date.getMonth() + 1) << 5) | Date.getDate();
    return { Time: Time, Date: Day };
  }

  function Build(Files) {
    var Names = Object.keys(Files);
    var Now = DosDateTime(new Date());
    var entries = [];
    return Names.reduce(function (chain, Name) { return chain.then(function () {
      return ToBytes(Files[Name]).then(function (Raw) {
        return (/\.(?:webp|jpg|png|gif|mp4|webm|mp3|ogg|woff2)$/i.test(Name) ? Promise.resolve(null) : DeflateRaw(Raw)).then(function (Deflated) {
          var UseDeflate = Deflated && Deflated.length > 0 && Deflated.length < Raw.length;
          entries.push({
            Name: Name,
            NameBytes: EncodeText(Name),
            RawSize: Raw.length,
            Data: UseDeflate ? Deflated : Raw,
            Method: UseDeflate ? 8 : 0,
            Crc: Crc32(Raw)
          });
        });
      });
    }); }, Promise.resolve()).then(function () {
      var Entries = entries;
      var LocalParts = [];
      var CentralParts = [];
      var Offset = 0;

      Entries.forEach(function (Entry) {
        var Local = new Uint8Array(30 + Entry.NameBytes.length + Entry.Data.length);
        var LView = new DataView(Local.buffer);
        WriteUint32(LView, 0, 0x04034b50);
        WriteUint16(LView, 4, 20);
        WriteUint16(LView, 6, 0x0800);
        WriteUint16(LView, 8, Entry.Method);
        WriteUint16(LView, 10, Now.Time);
        WriteUint16(LView, 12, Now.Date);
        WriteUint32(LView, 14, Entry.Crc);
        WriteUint32(LView, 18, Entry.Data.length);
        WriteUint32(LView, 22, Entry.RawSize);
        WriteUint16(LView, 26, Entry.NameBytes.length);
        WriteUint16(LView, 28, 0);
        Local.set(Entry.NameBytes, 30);
        Local.set(Entry.Data, 30 + Entry.NameBytes.length);
        LocalParts.push(Local);

        var Central = new Uint8Array(46 + Entry.NameBytes.length);
        var CView = new DataView(Central.buffer);
        WriteUint32(CView, 0, 0x02014b50);
        WriteUint16(CView, 4, 20);
        WriteUint16(CView, 6, 20);
        WriteUint16(CView, 8, 0x0800);
        WriteUint16(CView, 10, Entry.Method);
        WriteUint16(CView, 12, Now.Time);
        WriteUint16(CView, 14, Now.Date);
        WriteUint32(CView, 16, Entry.Crc);
        WriteUint32(CView, 20, Entry.Data.length);
        WriteUint32(CView, 24, Entry.RawSize);
        WriteUint16(CView, 28, Entry.NameBytes.length);
        WriteUint16(CView, 30, 0);
        WriteUint16(CView, 32, 0);
        WriteUint16(CView, 34, 0);
        WriteUint16(CView, 36, 0);
        WriteUint32(CView, 38, 0);
        WriteUint32(CView, 42, Offset);
        Central.set(Entry.NameBytes, 46);
        CentralParts.push(Central);

        Offset += Local.length;
      });

      var CentralSize = CentralParts.reduce(function (Sum, Part) { return Sum + Part.length; }, 0);
      var End = new Uint8Array(22);
      var EView = new DataView(End.buffer);
      WriteUint32(EView, 0, 0x06054b50);
      WriteUint16(EView, 4, 0);
      WriteUint16(EView, 6, 0);
      WriteUint16(EView, 8, Entries.length);
      WriteUint16(EView, 10, Entries.length);
      WriteUint32(EView, 12, CentralSize);
      WriteUint32(EView, 16, Offset);
      WriteUint16(EView, 20, 0);

      var Total = Offset + CentralSize + End.length;
      var Out = new Uint8Array(Total);
      var Position = 0;
      LocalParts.concat(CentralParts).forEach(function (Part) {
        Out.set(Part, Position);
        Position += Part.length;
      });
      Out.set(End, Position);
      return Out;
    });
  }

  return {
    Build: Build,
    Crc32: Crc32,
    EncodeText: EncodeText,
    DataUrlToBytes: DataUrlToBytes
  };
});
