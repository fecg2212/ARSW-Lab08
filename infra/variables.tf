variable "prefix" {
  type    = string
  default = "lab8"
}

variable "location" {
  type    = string
  default = "brazilsouth"
}

variable "vm_count" {
  type    = number
  default = 2
}

variable "admin_username" {
  type    = string
  default = "student"
}

variable "ssh_public_key" {
  type = string
}

variable "allow_ssh_from_cidr" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
