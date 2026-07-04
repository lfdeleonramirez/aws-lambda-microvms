# AWS Lambda MicroVM - Lab de Python con IDE en la nube

## ¿Qué es esto?

Este proyecto despliega un entorno de desarrollo (VS Code en el navegador) usando **AWS Lambda MicroVMs** para que los estudiantes de un bootcamp puedan completar ejercicios de Python directamente desde su navegador, sin instalar nada en su máquina local.

Cada estudiante recibe su propia MicroVM aislada con:
- Un IDE completo (code-server / VS Code)
- Python 3 + pytest preinstalados
- Ejercicios y tests listos para trabajar

## Arquitectura

```
Estudiante (navegador)
    │
    ▼
Lambda MicroVM (Firecracker snapshot)
    ├── code-server (puerto 8080) → IDE en el navegador
    ├── hook_server.js (puerto 8081) → lifecycle hooks
    ├── Python 3 + pytest
    └── /home/coder/workspace/
         ├── main.py          ← ejercicios
         └── tests/
              ├── test_main.py ← tests automatizados
              └── conftest.py  ← config de pytest
```

## Requisitos previos

- Cuenta de AWS con acceso a Lambda MicroVMs
- AWS CLI configurado
- Un bucket de S3 para subir el artefacto

## Estructura del proyecto

```
.
├── Dockerfile          # Imagen con code-server + Python + hooks
├── start.sh            # Script de arranque (hook server + code-server)
├── hook_server.js      # Servidor HTTP para lifecycle hooks de MicroVMs
├── despliegue.sh       # Script para empaquetar y subir a S3
├── ejercicio/          # Archivos del lab para el estudiante
│   ├── main.py
│   ├── README.md
│   └── tests/
│       ├── test_main.py
│       └── conftest.py
└── README.md           # Este archivo
```

## Cómo desplegarlo

### 1. Empaquetar y subir a S3

```bash
# Editar BUCKET en despliegue.sh si es necesario
chmod +x despliegue.sh
./despliegue.sh
```

Esto crea `bootcamp-lab.zip` con los archivos necesarios y lo sube a S3.

### 2. Crear la imagen MicroVM (desde la consola de AWS)

1. Ir a **Lambda > MicroVM Images > Create image**
2. Configurar:
   - **Name:** `lambda-python-lab`
   - **S3 URI:** `s3://microvm-bucket/bootcamp-lab.zip`
   - **Memory:** 2 GB (recomendado para code-server)
   - **Base image:** `al2023-1`
3. En **Image build lifecycle hooks:**
   - Ready: **Enabled**, timeout: **120 seconds**
   - Port: **8081**
4. En **MicroVM lifecycle hooks:**
   - Port: **8081**
   - Run: **Enabled**, timeout: **60 seconds**
   - Resume, Suspend, Terminate: **Disabled**
5. Click en **Create**

Esperar a que el estado cambie a `CREATED` (1-3 minutos).

### 3. Lanzar una MicroVM

1. En la imagen creada, click **Run MicroVM**
2. Configurar:
   - **Ingress:** HTTP
   - **Egress:** Internet
   - **Maximum lifetime:** 3600 (1 hora) o según necesidad
3. Click **Run**

### 4. Generar token de acceso

```bash
aws lambda-microvms create-microvm-auth-token \
  --microvm-identifier <microvm-id> \
  --expiration-in-minutes 60 \
  --allowed-ports '[{"allPorts":{}}]'
```

### 5. Acceder al IDE

Usar el token en el header `X-aws-proxy-auth` al acceder al endpoint de la MicroVM.

Con curl:
```bash
curl https://<endpoint> -H "X-aws-proxy-auth: <token>"
```

Desde el navegador: usar una extensión como **ModHeader** para inyectar el header automáticamente.

## Cómo funciona el hook server

Lambda MicroVMs requiere que tu aplicación responda a lifecycle hooks en un puerto dedicado. El archivo `hook_server.js` es un servidor HTTP mínimo en Node.js que:

- Responde **200 OK** al hook `/ready` durante el build (para que Lambda sepa cuándo tomar el snapshot)
- Responde **200 OK** al hook `/run` cuando se arranca una MicroVM

Sin esto, Lambda no sabe cuándo tu aplicación está lista y el build falla.

## Notas importantes

- La imagen de code-server pesa ~870 MB en snapshot — es normal, incluye el SO completo + runtime
- El token de acceso es obligatorio (JWE) — no hay opción de acceso sin autenticación
- Cada MicroVM tiene su propio endpoint dedicado
- Las MicroVMs se pueden suspender cuando están inactivas para reducir costos
- Máximo tiempo de vida: 8 horas

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Build falla sin logs | Verificar que el ZIP incluya todos los archivos: `unzip -l bootcamp-lab.zip` |
| `COPY: not found` | El archivo referenciado en el Dockerfile no está en el ZIP |
| Hook timeout | Node.js no está instalado → agregar `apt-get install nodejs` al Dockerfile |
| `ModuleNotFoundError: main` | Falta `conftest.py` en la carpeta tests/ |
| Auth disabled no funciona | Crear `/root/.config/code-server/config.yaml` con `auth: none` |
