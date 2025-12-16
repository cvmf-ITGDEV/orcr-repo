import { useState } from 'react'
import { Building, FileText, Database } from 'lucide-react'
import { Card, Button, Input } from '../components/ui'

export function SettingsPage() {
  const [companyName, setCompanyName] = useState('LoanFlow Financial Services')
  const [companyAddress, setCompanyAddress] = useState('123 Finance Street, Makati City')
  const [companyTin, setCompanyTin] = useState('000-000-000-000')
  const [orPrefix, setOrPrefix] = useState('OR')
  const [crPrefix, setCrPrefix] = useState('CR')
  const [saving, setSaving] = useState(false)

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
    }, 1000)
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage system configuration</p>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-royal-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-royal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              <p className="text-sm text-gray-500">Your organization details for receipts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Input label="TIN" value={companyTin} onChange={(e) => setCompanyTin(e.target.value)} />
            <div className="md:col-span-2">
              <Input
                label="Address"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-royal-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-royal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Receipt Settings</h2>
              <p className="text-sm text-gray-500">Configure OR/CR numbering</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Official Receipt Prefix"
              value={orPrefix}
              onChange={(e) => setOrPrefix(e.target.value)}
              helpText="e.g., OR-2024-0001"
            />
            <Input
              label="Collection Receipt Prefix"
              value={crPrefix}
              onChange={(e) => setCrPrefix(e.target.value)}
              helpText="e.g., CR-2024-0001"
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-royal-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-royal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
              <p className="text-sm text-gray-500">Database and system status</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Database</p>
              <p className="font-medium text-green-600">Connected</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Version</p>
              <p className="font-medium text-gray-900">1.0.0</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Environment</p>
              <p className="font-medium text-gray-900">Production</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">PSGC Data</p>
              <p className="font-medium text-green-600">Loaded</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
