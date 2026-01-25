#!/bin/bash

# Script para verificar usuarios en la BD
echo "==================================================="
echo "VERIFICANDO USUARIOS EN BASE DE DATOS"
echo "==================================================="

gcloud sql connect swarco-mysql --user=deployuser --database=swarco_ops << 'EOF'
SELECT id, usuario, email, nombre, apellidos, emailVerified, rol 
FROM usuarios 
ORDER BY id 
LIMIT 20;
EOF

echo ""
echo "==================================================="
echo "VERIFICACION COMPLETADA"
echo "==================================================="
