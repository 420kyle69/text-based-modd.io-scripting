<title>API Actions</title>

# API Reference
**Actions** | [Functions](#api-functions) | [Triggers](#api-triggers)

[Docs](#docs)

| Key | Title | Configuration properties |
| --- | ----- | ------------------------ |

<script type="text/plain" id="script-to-run">
  docs_fetchWithCache('../functions.json').then(res => res.json()).then(res => {
    if (res.status !== 'success') {
      console.log('Non success response received from Modd.io API: %o', res);
      alert('Non-success response received from Modd.io API. Check console for details.');
      return;
    }
    const table = document.querySelector('table');
    for (const func of res.message) {
      if (func.data.type === 'action') {
        const row = table.insertRow();
        row.insertCell().textContent = func.key;
        row.insertCell().textContent = func.title;
        row.insertCell().textContent = `{ ${func.data.fragments.filter(frag => frag.field && (frag.type === 'variable' || func.data.fields)).map(frag => `${frag.field}: ${frag.type === 'variable' ? frag.extraData?.dataType || frag.dataType : 'action[]'}`).join(', ')} }`;
      }
    }
  }).catch(err => {
    console.error(err);
    alert('An error occured while fetching Modd.io API. Check console for details.');
  });
</script>