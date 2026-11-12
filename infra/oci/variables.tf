variable "compartment_ocid" {
  type        = string
  description = "OCI Compartment OCID where resources will be created (can be your root tenancy OCID)."
}

variable "region" {
  type        = string
  default     = ""
  description = "OCI region identifier (e.g. ap-mumbai-1, us-ashburn-1, eu-frankfurt-1). Auto-filled in OCI Resource Manager."
}

variable "tenancy_ocid" {
  type        = string
  default     = ""
  description = "Tenancy OCID. Leave empty in OCI Resource Manager; required for local OpenTofu/Terraform CLI if not using ~/.oci/config."
}

variable "user_ocid" {
  type        = string
  default     = ""
  description = "User OCID for local OpenTofu/Terraform CLI auth. Leave empty in OCI Resource Manager."
}

variable "fingerprint" {
  type        = string
  default     = ""
  description = "API key fingerprint for local OpenTofu/Terraform CLI auth. Leave empty in OCI Resource Manager."
}

variable "private_key_path" {
  type        = string
  default     = ""
  description = "Path to OCI API private key (.pem) for local CLI auth. Leave empty in OCI Resource Manager."
}

variable "project_name" {
  type        = string
  default     = "strangerchat"
  description = "Prefix used for naming VCN, subnet, and compute instance."
}

variable "availability_domain_index" {
  type        = number
  default     = 0
  description = "Zero-based index of the Availability Domain (0, 1, or 2). Try another index if Ampere A1 capacity is full in AD 0."

  validation {
    condition     = var.availability_domain_index >= 0 && var.availability_domain_index <= 2
    error_message = "availability_domain_index must be 0, 1, or 2."
  }
}

variable "instance_ocpus" {
  type        = number
  default     = 4
  description = "Number of Ampere A1 ARM OCPUs (Always Free tier allows up to 4 OCPUs total per tenancy)."

  validation {
    condition     = var.instance_ocpus >= 1 && var.instance_ocpus <= 4
    error_message = "Stay between 1 and 4 OCPUs to remain inside OCI Always Free limits."
  }
}

variable "instance_memory_in_gbs" {
  type        = number
  default     = 24
  description = "RAM in GB (Always Free tier allows up to 24 GB total; max 6 GB per OCPU)."

  validation {
    condition     = var.instance_memory_in_gbs >= 1 && var.instance_memory_in_gbs <= 24
    error_message = "Stay between 1 and 24 GB RAM to remain inside OCI Always Free limits."
  }
}

variable "boot_volume_size_in_gbs" {
  type        = number
  default     = 100
  description = "Boot volume size in GB (Always Free tier allows up to 200 GB total across all instances)."

  validation {
    condition     = var.boot_volume_size_in_gbs >= 50 && var.boot_volume_size_in_gbs <= 200
    error_message = "Boot volume must be between 50 GB (OCI minimum) and 200 GB (Always Free maximum)."
  }
}

variable "ssh_public_key" {
  type        = string
  description = "OpenSSH public key (contents of ~/.ssh/id_ed25519.pub or id_rsa.pub) for SSH access as the 'ubuntu' user."
}

variable "ssh_allowed_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "CIDR block allowed to SSH (port 22). Lock this down to YOUR_IP/32 after initial setup."
}

variable "vcn_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VCN IPv4 CIDR block."
}

variable "vcn_dns_label" {
  type        = string
  default     = ""
  description = "Optional VCN DNS label (max 15 alphanumeric chars). Leave empty to derive from project_name."
}

variable "subnet_cidr" {
  type        = string
  default     = "10.0.1.0/24"
  description = "Public subnet IPv4 CIDR block."
}

variable "subnet_dns_label" {
  type        = string
  default     = "public"
  description = "Public subnet DNS label."
}
