# 🚀 Kubernetes Learning Project  
### **Frontend:** Preact + Vite  
### **Backend:** Node.js (Express)  
### **Database:** SQLite  
### **Cluster:** Minikube

This project is a simple full-stack application deployed on Kubernetes using Minikube.  
It is designed to help learn Kubernetes basics: Deployments, Services, NodePorts, ClusterIP networking, and Pods.

---

## 🏗️ Project Architecture


- **Frontend:** Preact + Vite  
- **Backend:** Node.js (Express)  
- **Database:** SQLite (file stored inside backend pod)  

---



## To get run project on minikube
1. Start Minikube
```minikube start```

2. Deploy Backend
```
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml
```
3. Deploy Frontend
```
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml
```
4. Verify Resources
```
kubectl get pods -n learn-kube
kubectl get svc -n learn-kube
```
