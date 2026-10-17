'use strict';

// طبقة التخزين: IndexedDB داخل الهاتف. كل وصول إلى البيانات يمرّ من هنا وحدها،
// حتى يمكن تبديلها في نسخة APK دون مسّ بقية الكود.
(function (hifz) {
  // صفحة الاختبارات تضبط HIFZ_DB_NAME لقاعدة منفصلة، فلا تمسّ محفوظات المستخدم
  const DB_NAME = window.HIFZ_DB_NAME || 'hifz-alshir';
  const DB_VERSION = 1;
  const STORES = {
    poems: { keyPath: 'id' },
    abyat: { keyPath: 'id', indexes: [['poemId', 'poemId']] },
    reviews: { keyPath: 'baytId', indexes: [['nextDue', 'nextDue']] },
  };

  let opening = null;

  function open() {
    if (opening) return opening;
    opening = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const [name, def] of Object.entries(STORES)) {
          if (db.objectStoreNames.contains(name)) continue;
          const store = db.createObjectStore(name, { keyPath: def.keyPath });
          for (const [indexName, keyPath] of def.indexes || []) store.createIndex(indexName, keyPath);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return opening;
  }

  const done = (request) => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const finished = (tx) => new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

  async function getAll(store) {
    const db = await open();
    return done(db.transaction(store).objectStore(store).getAll());
  }

  async function get(store, key) {
    const db = await open();
    return done(db.transaction(store).objectStore(store).get(key));
  }

  async function count(store) {
    const db = await open();
    return done(db.transaction(store).objectStore(store).count());
  }

  async function put(store, record) {
    const db = await open();
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(record);
    await finished(tx);
    return record;
  }

  async function remove(store, key) {
    const db = await open();
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    await finished(tx);
  }

  // يكتب سجلات من عدة مخازن في معاملة واحدة: تنجح كلها أو لا يُكتب شيء
  async function putMany(recordsByStore) {
    const names = Object.keys(recordsByStore);
    const db = await open();
    const tx = db.transaction(names, 'readwrite');
    for (const name of names) {
      const store = tx.objectStore(name);
      for (const record of recordsByStore[name]) store.put(record);
    }
    await finished(tx);
  }

  // يكتب ويحذف في عدة مخازن بمعاملة واحدة: ينجح كله أو لا يتغير شيء
  async function commit({ put: puts = {}, remove: removes = {} }) {
    const names = [...new Set([...Object.keys(puts), ...Object.keys(removes)])];
    if (!names.length) return;
    const db = await open();
    const tx = db.transaction(names, 'readwrite');
    for (const [name, records] of Object.entries(puts)) {
      const store = tx.objectStore(name);
      for (const record of records) store.put(record);
    }
    for (const [name, keys] of Object.entries(removes)) {
      const store = tx.objectStore(name);
      for (const key of keys) store.delete(key);
    }
    await finished(tx);
  }

  async function abyatOfPoem(poemId) {
    const db = await open();
    const index = db.transaction('abyat').objectStore('abyat').index('poemId');
    const abyat = await done(index.getAll(poemId));
    return abyat.sort((a, b) => a.order - b.order);
  }

  // المراجعات التي حان موعدها حتى نهاية اليوم المعطى (تاريخ بصيغة YYYY-MM-DD)
  async function dueReviews(untilDay) {
    const db = await open();
    const index = db.transaction('reviews').objectStore('reviews').index('nextDue');
    return done(index.getAll(IDBKeyRange.upperBound(untilDay)));
  }

  hifz.db = { STORES: Object.keys(STORES), open, get, getAll, count, put, remove, putMany, commit, abyatOfPoem, dueReviews };
})(window.hifz = window.hifz || {});
