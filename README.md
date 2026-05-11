# Felinamente

Proyecto de plataforma de adopción de gatos para la protectora.

## Tecnologías
- **Backend**: PHP 8.2 (API REST)
- **Frontend**: JavaScript, Bootstrap 5, CSS3
- **Base de Datos**: MySQL (Aiven)
- **Despliegue**: Docker en Render

## Requisitos de Entorno
Para que la conexión a la base de datos funcione en producción, se deben configurar las siguientes variables de entorno:
- `DB_HOST`: Host de Aiven
- `DB_PORT`: Puerto (habitualmente 24430)
- `DB_NAME`: Nombre de la DB
- `DB_USER`: Usuario
- `DB_PASS`: Contraseña
- `MYSQL_ATTR_SSL_CA`: Contenido del certificado CA de Aiven

## Instalación Local
1. Clona el repositorio.
2. Configura un servidor Apache con PHP 8.2.
3. Importa el esquema en `api/schema.sql`.
4. ¡Listo!
