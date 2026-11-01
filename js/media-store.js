(function (Global) {
  'use strict';
  var dbPromise, urls=new Map(), ids=new Map(), blobs=new Map();
  function open(){if(!dbPromise)dbPromise=new Promise(function(resolve,reject){var r=indexedDB.open('gunslol2',2);r.onupgradeneeded=function(){if(!r.result.objectStoreNames.contains('drafts'))r.result.createObjectStore('drafts');if(!r.result.objectStoreNames.contains('assets'))r.result.createObjectStore('assets');};r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error);};});return dbPromise;}
  function get(store,key){return open().then(db=>new Promise((resolve,reject)=>{var r=db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);}));}
  function put(store,key,value){return open().then(db=>new Promise((resolve,reject)=>{var tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);}));}
  function objectUrl(id,blob){if(!urls.has(id)){var url=URL.createObjectURL(blob);urls.set(id,url);ids.set(url,id);blobs.set(url,blob);}return urls.get(id);}
  async function map(value,fn){if(typeof value==='string')return fn(value);if(Array.isArray(value)){var list=[];for(var item of value)list.push(await map(item,fn));return list;}if(value&&typeof value==='object'){var out={};for(var key of Object.keys(value))out[key]=await map(value[key],fn);return out;}return value;}
  function dataUrl(blob){return new Promise((resolve,reject)=>{var r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});}
  async function add(blob){var id=crypto.randomUUID();await put('assets',id,blob);return objectUrl(id,blob);}
  async function prepare(config){var converted=new Map();return map(config,async value=>{if(!/^data:(?:image|video|audio|font|application\/octet-stream)/i.test(value))return value;if(!converted.has(value))converted.set(value,fetch(value).then(r=>r.blob()).then(add));return converted.get(value);});}
  Global.ProfileStore={
    addAsset:add,
    type:url=>blobs.get(url)?.type || '',
    prepare:prepare,
    load:async function(){var raw=await get('drafts','profile')||JSON.parse(localStorage.getItem('aboutu-draft-v1')||'null');if(!raw)return null;
      raw=Global.CleanLegacyDraft?Global.CleanLegacyDraft(raw):raw;
      var resolved=await map(raw,async value=>{if(!value.startsWith('asset:'))return value;var id=value.slice(6),blob=await get('assets',id);return blob?objectUrl(id,blob):'';});return prepare(resolved);
    },
    save:async function(config){var stored=await map(config,value=>ids.has(value)?'asset:'+ids.get(value):value);await put('drafts','profile',stored);},
    portable:async function(config){var converted=new Map();return map(config,value=>{if(!blobs.has(value))return value;if(!converted.has(value))converted.set(value,dataUrl(blobs.get(value)));return converted.get(value);});},
    releaseUnused:function(config){var active=new Set();function walk(v){if(typeof v==='string')active.add(v);else if(v&&typeof v==='object')Object.values(v).forEach(walk);}walk(config);for(var [id,url] of urls){if(!active.has(url)){URL.revokeObjectURL(url);urls.delete(id);ids.delete(url);blobs.delete(url);}}}
  };
  window.addEventListener('pagehide',function(event){if(event.persisted)return;urls.forEach(url=>URL.revokeObjectURL(url));urls.clear();ids.clear();blobs.clear();});
})(window);
