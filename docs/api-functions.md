<title>API Functions</title>

# API Reference
[Actions](./api-actions.html) | **Functions** | [Triggers](./api-triggers.html)

[Docs](./)

| Key | Title | Configuration properties | Return type |

| --- | ----- | ------------------------ | ----------- |

|     |       |                          |             |

<script type="module" src="../scripts/docs.js"></script>
<script type="module">
  docs_fetchWithCache('../functions.json').then(res => res.json()).then(res => {
    if (res.status !== 'success') {
      console.log('Non success response received from Modd.io API: %o', res);
      alert('Non-success response received from Modd.io API. Check console for details.');
      return;
    }
    const table = document.querySelector('table');
    for (const func of res.message) {
      if (func.data.type === 'function') {
        const row = table.insertRow();
        row.insertCell().textContent = func.key;
        row.insertCell().textContent = func.title;
        row.insertCell().textContent = `{ ${func.data.fragments.filter(frag => frag.type === 'variable').map(frag => `${frag.field}: ${frag.extraData?.dataType || frag.dataType}`).join(', ')} }`;
        row.insertCell().textContent = func.data.category;
      }
    }
  }).catch(err => {
    console.error(err);
    alert('An error occured while fetching Modd.io API. Check console for details.');
  });
</script>