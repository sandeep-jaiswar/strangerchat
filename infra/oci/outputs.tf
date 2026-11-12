output "public_ip" {
  description = "Public IPv4 address of the Oracle Always Free Ampere VM"
  value       = oci_core_instance.app.public_ip
}

output "ssh_command" {
  description = "Command to SSH into the server"
  value       = "ssh ubuntu@${oci_core_instance.app.public_ip}"
}

output "instance_ocid" {
  description = "OCID of the compute instance"
  value       = oci_core_instance.app.id
}

output "availability_domain" {
  description = "Availability Domain where the VM was provisioned"
  value       = oci_core_instance.app.availability_domain
}

output "next_steps" {
  description = "Post-provisioning instructions"
  value       = <<-EOT
    1. Point your domain DNS A record (@ and www) to: ${oci_core_instance.app.public_ip}
    2. Wait ~2 minutes for cloud-init to finish installing Docker, then SSH in:
       ssh ubuntu@${oci_core_instance.app.public_ip}
    3. Verify Docker is ready: docker --version && docker compose version
    4. Clone the repo into /opt/strangerchat, configure .env, and run:
       docker compose up -d --build
  EOT
}
