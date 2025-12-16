import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Select, Input } from '../ui'
import type { Region, Province, City, Barangay } from '../../types/database'

interface PSGCAddressSelectorProps {
  prefix: string
  values: {
    region: string
    province: string
    city: string
    barangay: string
    street: string
    zip: string
  }
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export function PSGCAddressSelector({
  prefix,
  values,
  onChange,
  errors = {},
  disabled = false
}: PSGCAddressSelectorProps) {
  const [regions, setRegions] = useState<Region[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loading, setLoading] = useState({ regions: true, provinces: false, cities: false, barangays: false })

  useEffect(() => {
    fetchRegions()
  }, [])

  useEffect(() => {
    if (values.region) {
      fetchProvinces(values.region)
    } else {
      setProvinces([])
      setCities([])
      setBarangays([])
    }
  }, [values.region])

  useEffect(() => {
    if (values.province) {
      fetchCities(values.province)
    } else {
      setCities([])
      setBarangays([])
    }
  }, [values.province])

  useEffect(() => {
    if (values.city) {
      fetchBarangays(values.city)
    } else {
      setBarangays([])
    }
  }, [values.city])

  async function fetchRegions() {
    setLoading((prev) => ({ ...prev, regions: true }))
    const { data } = await supabase.from('psgc_regions').select('*').order('name')
    setRegions(data || [])
    setLoading((prev) => ({ ...prev, regions: false }))
  }

  async function fetchProvinces(regionCode: string) {
    setLoading((prev) => ({ ...prev, provinces: true }))
    const { data } = await supabase
      .from('psgc_provinces')
      .select('*')
      .eq('region_code', regionCode)
      .order('name')
    setProvinces(data || [])
    setLoading((prev) => ({ ...prev, provinces: false }))
  }

  async function fetchCities(provinceCode: string) {
    setLoading((prev) => ({ ...prev, cities: true }))
    const { data } = await supabase
      .from('psgc_cities')
      .select('*')
      .eq('province_code', provinceCode)
      .order('name')
    setCities(data || [])
    setLoading((prev) => ({ ...prev, cities: false }))
  }

  async function fetchBarangays(cityCode: string) {
    setLoading((prev) => ({ ...prev, barangays: true }))
    const { data } = await supabase
      .from('psgc_barangays')
      .select('*')
      .eq('city_code', cityCode)
      .order('name')
    setBarangays(data || [])
    setLoading((prev) => ({ ...prev, barangays: false }))
  }

  function handleRegionChange(value: string) {
    onChange(`${prefix}_region`, value)
    onChange(`${prefix}_province`, '')
    onChange(`${prefix}_city`, '')
    onChange(`${prefix}_barangay`, '')
  }

  function handleProvinceChange(value: string) {
    onChange(`${prefix}_province`, value)
    onChange(`${prefix}_city`, '')
    onChange(`${prefix}_barangay`, '')
  }

  function handleCityChange(value: string) {
    onChange(`${prefix}_city`, value)
    onChange(`${prefix}_barangay`, '')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        label="Region"
        value={values.region}
        onChange={(e) => handleRegionChange(e.target.value)}
        options={regions.map((r) => ({ value: r.code, label: r.name }))}
        placeholder={loading.regions ? 'Loading...' : 'Select Region'}
        error={errors[`${prefix}_region`]}
        disabled={disabled || loading.regions}
        required
      />

      <Select
        label="Province"
        value={values.province}
        onChange={(e) => handleProvinceChange(e.target.value)}
        options={provinces.map((p) => ({ value: p.code, label: p.name }))}
        placeholder={loading.provinces ? 'Loading...' : 'Select Province'}
        error={errors[`${prefix}_province`]}
        disabled={disabled || !values.region || loading.provinces}
        required
      />

      <Select
        label="City/Municipality"
        value={values.city}
        onChange={(e) => handleCityChange(e.target.value)}
        options={cities.map((c) => ({ value: c.code, label: c.name }))}
        placeholder={loading.cities ? 'Loading...' : 'Select City/Municipality'}
        error={errors[`${prefix}_city`]}
        disabled={disabled || !values.province || loading.cities}
        required
      />

      <Select
        label="Barangay"
        value={values.barangay}
        onChange={(e) => onChange(`${prefix}_barangay`, e.target.value)}
        options={barangays.map((b) => ({ value: b.code, label: b.name }))}
        placeholder={loading.barangays ? 'Loading...' : 'Select Barangay'}
        error={errors[`${prefix}_barangay`]}
        disabled={disabled || !values.city || loading.barangays}
        required
      />

      <Input
        label="Street Address"
        value={values.street}
        onChange={(e) => onChange(`${prefix}_street`, e.target.value)}
        placeholder="House/Building No., Street Name"
        error={errors[`${prefix}_street`]}
        disabled={disabled}
        required
      />

      <Input
        label="ZIP Code"
        value={values.zip}
        onChange={(e) => onChange(`${prefix}_zip`, e.target.value)}
        placeholder="e.g., 1000"
        error={errors[`${prefix}_zip`]}
        disabled={disabled}
        maxLength={4}
        required
      />
    </div>
  )
}
