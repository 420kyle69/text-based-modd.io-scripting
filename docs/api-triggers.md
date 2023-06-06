<title>API Triggers</title>

# API Reference
[Actions](./api-actions.html) | [Functions](./api-functions.html) | **Triggers**

[Docs](./)

| Key | Title | Parameters provided | Used in |
| --- | ----- | ------------------- | ------- |

<script type="module" src="../scripts/docs.js"></script>
<script type="text/plain" id="script-to-run">
  docs_fetchWithCache('../triggers.json').then(res => res.json()).then(res => {
    if (res.status !== 'success') {
      console.log('Non success response received from Modd.io API: %o', res);
      alert('Non-success response received from Modd.io API. Check console for details.');
      return;
    }
    const table = document.querySelector('table');
    for (const trig of res.message) {
      const row = table.insertRow();
      row.insertCell().textContent = trig.key;
      row.insertCell().textContent = trig.title;
      row.insertCell().textContent = trig.data.vars?.join?.(', ') || 'none';
      row.insertCell().textContent = trig.usedIn.join(', ');
    }
  }).catch(err => {
    console.error(err);
    alert('An error occured while fetching Modd.io API. Check console for details.');
  });
</script>