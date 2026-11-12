#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_ZIP="${SCRIPT_DIR}/strangerchat-oci-stack.zip"

rm -f "${OUT_ZIP}"
(
  cd "${SCRIPT_DIR}"
  zip -r "${OUT_ZIP}" \
    versions.tf \
    variables.tf \
    main.tf \
    outputs.tf \
    cloud-init.yaml \
    schema.yaml
)

echo "Created OCI Resource Manager stack bundle: ${OUT_ZIP}"
