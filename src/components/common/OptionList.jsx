/**
 * Renderiza una lista de <option> a partir de un array de valores string.
 */
export default function OptionList({ values }) {
  return values.map((value) => (
    <option key={value} value={value}>
      {value}
    </option>
  ))
}
