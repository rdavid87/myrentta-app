import { FormControl, InputLabel, Select } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { glassInputSx } from "./glassStyles"

const GlassSelect = ({
  label,
  labelId,
  value,
  onChange,
  children,
  disabled,
  required,
  sx = {},
}) => {
  const theme = useTheme()
  const id = labelId ?? `${label}-label`.replace(/\s/g, "-").toLowerCase()

  return (
    <FormControl size="small" fullWidth required={required} sx={{ ...glassInputSx(theme), ...sx }}>
      <InputLabel id={id}>{label}</InputLabel>
      <Select labelId={id} label={label} value={value} onChange={onChange} disabled={disabled}>
        {children}
      </Select>
    </FormControl>
  )
}

export default GlassSelect
