import AddressDisplay from './AddressDisplay'

interface Props {
  title: string
  counts: { [index: string]: number }
  currentSigners: string[]
}

export const CountTable = ({ title, counts, currentSigners }: Props) => {
  return (
    <div>
      <h2 className="p-2 text-xl">{title}</h2>
      <table className="table-auto border-collapse text-left">
        <thead>
          <tr>
            <th className="border p-1">Signer</th>
            <th className="border p-1">Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([signer, count]) => (
              <tr key={signer}>
                <td
                  className={`border p-1 decoration-red-500 ${currentSigners.includes(signer) ? '' : 'line-through'}`}
                >
                  <AddressDisplay address={signer} />
                </td>
                <td className="border p-1">{count}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
