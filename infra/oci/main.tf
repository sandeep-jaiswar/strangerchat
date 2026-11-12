data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid != "" ? var.tenancy_ocid : var.compartment_ocid
}

data "oci_core_images" "ubuntu_arm" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"

  filter {
    name   = "display_name"
    values = ["^Canonical-Ubuntu-24\\.04-aarch64-.*"]
    regex  = true
  }
}

locals {
  ad_count            = length(data.oci_identity_availability_domains.ads.availability_domains)
  ad_index            = min(var.availability_domain_index, local.ad_count - 1)
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[local.ad_index].name
  dns_prefix          = substr(replace(lower(var.project_name), "/[^a-z0-9]/", ""), 0, 12)
  vcn_dns_label       = var.vcn_dns_label != "" ? var.vcn_dns_label : local.dns_prefix
}

resource "oci_core_vcn" "main" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = [var.vcn_cidr]
  display_name   = "${var.project_name}-vcn"
  dns_label      = local.vcn_dns_label
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-igw"
  enabled        = true
}

resource "oci_core_route_table" "public" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

resource "oci_core_security_list" "web" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-sl"

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    description = "Allow all outbound traffic (apt, Docker pulls, Google OAuth, Let's Encrypt)"
  }

  ingress_security_rules {
    protocol    = "1" # ICMP
    source      = "0.0.0.0/0"
    description = "Path MTU Discovery"

    icmp_options {
      type = 3
      code = 4
    }
  }

  ingress_security_rules {
    protocol    = "6" # TCP
    source      = var.ssh_allowed_cidr
    description = "SSH access"

    tcp_options {
      min = 22
      max = 22
    }
  }

  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    description = "HTTP (Let's Encrypt ACME + redirect to HTTPS)"

    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    description = "HTTPS + WebSockets (wss://)"

    tcp_options {
      min = 443
      max = 443
    }
  }

  ingress_security_rules {
    protocol    = "17" # UDP
    source      = "0.0.0.0/0"
    description = "HTTP/3 (QUIC) for Caddy"

    udp_options {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_subnet" "public" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.main.id
  cidr_block                 = var.subnet_cidr
  display_name               = "${var.project_name}-public-subnet"
  dns_label                  = var.subnet_dns_label
  prohibit_public_ip_on_vnic = false
  security_list_ids          = [oci_core_security_list.web.id]
  route_table_id             = oci_core_route_table.public.id
}

resource "oci_core_instance" "app" {
  availability_domain = local.availability_domain
  compartment_id      = var.compartment_ocid
  display_name        = "${var.project_name}-ampere-vm"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = var.instance_ocpus
    memory_in_gbs = var.instance_memory_in_gbs
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = var.boot_volume_size_in_gbs
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public.id
    assign_public_ip = true
    display_name     = "${var.project_name}-vnic"
    hostname_label   = local.dns_prefix
  }

  metadata = {
    ssh_authorized_keys = trimspace(var.ssh_public_key)
    user_data           = base64encode(file("${path.module}/cloud-init.yaml"))
  }

  # Protect the Always Free Ampere A1 instance from accidental destruction or replacement.
  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      source_details,
      metadata,
      create_vnic_details,
      shape_config,
    ]
  }
}
