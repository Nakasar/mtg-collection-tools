(async () => {
  const meiliEndpoint = 'http://localhost:7700';
  await fetch(`${meiliEndpoint}/indexes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "uid": "cards",
      "primaryKey": "id"
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to create index');
    }
  });

  await fetch(`${meiliEndpoint}/indexes/cards/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "searchableAttributes": [
        "flavor_name",
        "name",
        "printed_name",
        "printed_text",
        "printed_type_line",
        "flavor_text",
        "card_faces.name",
        "card_faces.printed_name",
        "card_faces.printed_text",
        "card_faces.printed_type_line",
        "card_faces.flavor_text"
      ],
      "filterableAttributes": ["lang", "set", "oracle_id", "collector_number"]
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to setup index');
    }
  });

})();