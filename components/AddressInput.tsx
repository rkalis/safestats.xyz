import { useRouter } from 'next/router'
import { useState } from 'react'
import { ADDRESS_REGEX } from 'utils/constants'

const AddressInput = () => {
  const router = useRouter()
  const [value, setValue] = useState<string>('')

  const submit = () => {
    if (ADDRESS_REGEX.test(value)) {
      router.push(`/safe/${value}`)
    }
  }

  return (
    <input
      type="text"
      placeholder="Please enter a valid Gnosis Safe address"
      className="w-full max-w-[600px] rounded-md border p-2 text-black"
      value={value}
      onChange={(ev) => setValue(ev.target.value)}
      onKeyDown={(ev) => ev.key === 'Enter' && submit()}
    />
  )
}

export default AddressInput
