output "vm_names" {
  value = azurerm_linux_virtual_machine.this[*].name
}

output "vm_private_ips" {
  value = azurerm_network_interface.this[*].private_ip_address
}
