resource "azurerm_resource_group" "this" {
  name     = "rg-${var.prefix}"
  location = var.location
  tags     = var.tags
}

module "vnet" {
  source              = "../modules/vnet"
  prefix              = var.prefix
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  allow_ssh_from_cidr = var.allow_ssh_from_cidr
  tags                = var.tags
}

module "lb" {
  source              = "../modules/lb"
  prefix              = var.prefix
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  tags                = var.tags
}

module "compute" {
  source              = "../modules/compute"
  prefix              = var.prefix
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  vm_count            = var.vm_count
  admin_username      = var.admin_username
  ssh_public_key      = file(var.ssh_public_key)
  subnet_id           = module.vnet.subnet_web_id
  backend_pool_id     = module.lb.backend_pool_id
  cloud_init          = file("${path.module}/cloud-init.yaml")
  tags                = var.tags
}
