const CURRENT_CACHE = 'docs_cache_v4';

caches.keys().then(keys => {
  keys.forEach(key => {
    if (key !== CURRENT_CACHE) {
      caches.delete(key);
    }
  });
});
const docs_cache = await caches.open(CURRENT_CACHE);
window.docs_fetchWithCache = async (url, options) => {
  const res = await docs_cache.match(url);
  if (res && Date.now() - Date.parse(res.headers.get('date')) < 8.64e7) {
    return res;
  }
  return fetch(url, options).then(res => {
    if (res.ok) {
      docs_cache.put(url, new Response(res.clone().body, {
        headers: {
          date: new Date().toGMTString(),
          ...Object.fromEntries(res.headers)
        }
      }));
    }
    return res;
  });
};
const markdownContainer = document.getElementsByClassName('markdown-body')[0],
  scriptToRun = markdownContainer.querySelector('script#script-to-run');
if (scriptToRun) {
  const script = document.createElement('script');
  script.textContent = scriptToRun.textContent;
  markdownContainer.replaceChild(script, scriptToRun);
}