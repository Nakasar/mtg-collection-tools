# Dev Setup

## Meilisearch (Search engine for cards)

- Run meili search container:
```bash
podman volume create meili_data
podman run -d -it \
  -p 7700:7700 \
  -e MEILI_ENV='development' \
  -v meili_data:/meili_data \
  --name meili \
  getmeili/meilisearch
```

- Or with removing the existing volume to reset state:
```bash
podman volume rm meili_data
podman volume create meili_data
podman run -d -it \
  -p 7700:7700 \
  -e MEILI_ENV='development' \
  -v meili_data:/meili_data \
  --name meili \
  getmeili/meilisearch
```

Create a cards index
```http request
POST http://localhost:7700/indexes
{
    "uid": "cards",
    "primaryKey": "id"
}
```

Set cards index searchable attributes and filterable attributes:
```http request
http://localhost:7700/indexes/:indexId/settings
{
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
    "filterableAttributes": ["name", "lang", "set", "oracle_id", "collector_number"]
}
```

## MongoDB (collection database)

- Run mongo container:
```bash
podman volume create mongo_data
podman run -d -it --rm \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  --name mongo \
  mongo
```
