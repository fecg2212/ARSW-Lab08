variable "prefix" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "vm_count" {
  type    = number
  default = 2
}

variable "admin_username" {
  type = string
}

variable "ssh_public_key" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "backend_pool_id" {
  type = string
}

variable "cloud_init" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
