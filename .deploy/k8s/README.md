## Deploy to Aliyun

- `kubectl create namespace prod`
- `kubectl apply -f ali-cnfs.yaml`
- `kubectl apply -f ali-secret.yaml`
- `kubectl apply -f ali-pv.yaml -n prod`
- `kubectl apply -f ali-manifest.yaml -n prod`
- 