prefix              = "lab8"
location            = "brazilsouth"
vm_count            = 2
admin_username      = "student"
ssh_public_key      = "~/.ssh/id_rsa_lab8.pub"
allow_ssh_from_cidr = "186.84.20.216/32"
tags = {
  owner   = "felipe.calvache"
  course  = "ARSW/BluePrints"
  env     = "dev"
  expires = "2026-06-01"
}
