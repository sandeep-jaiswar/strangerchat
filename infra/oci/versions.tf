terraform {
  required_version = ">= 1.5.0"

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 5.0.0"
    }
  }
}

# Works both in OCI Resource Manager (uses session auth when API key vars are empty)
# and locally via OpenTofu/Terraform CLI (uses ~/.oci/config or TF_VAR_* credentials).
provider "oci" {
  region           = var.region != "" ? var.region : null
  tenancy_ocid     = var.tenancy_ocid != "" ? var.tenancy_ocid : null
  user_ocid        = var.user_ocid != "" ? var.user_ocid : null
  fingerprint      = var.fingerprint != "" ? var.fingerprint : null
  private_key_path = var.private_key_path != "" ? var.private_key_path : null
}
