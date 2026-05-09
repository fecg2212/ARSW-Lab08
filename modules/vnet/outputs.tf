output "subnet_web_id" {
  value = azurerm_subnet.web.id
}

output "nsg_id" {
  value = azurerm_network_security_group.web.id
}
