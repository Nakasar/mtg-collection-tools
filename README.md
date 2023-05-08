# Dev Setup

- Run meili search container:
```bash
podman volume create meili_data
podman run -d -it --rm \
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
podman run -d -it --rm \
  -p 7700:7700 \
  -e MEILI_ENV='development' \
  -v meili_data:/meili_data \
  --name meili \
  getmeili/meilisearch
```