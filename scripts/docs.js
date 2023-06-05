const CURRENT_CACHE = 'docs_cache_v4';

const markdownContainer = document.getElementById('content');
function loadMarkdown(text) {
  markdownContainer.innerHTML = marked.parse(text);
  hljs.highlightAll({ cssSelector: '#content pre' });
  markdownContainer.querySelectorAll('table').forEach(table => {
    table.classList.add('table');
  });
  const scriptToRun = markdownContainer.querySelector('script#script-to-run');
  if (scriptToRun) {
    const script = document.createElement('script');
    script.append(scriptToRun.textContent);
    markdownContainer.replaceChild(script, scriptToRun);
  }
}
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
window.onhashchange = () => {
  docs_fetchWithCache(`/docs/docs/${location.hash.slice(1)}.md`).then(res => {
    if (res.ok) {
      res.text().then(loadMarkdown);
    }
  });
};
if (location.hash) {
  onhashchange();
} else {
  location.hash = 'docs';
}