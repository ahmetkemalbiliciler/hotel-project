export default function FormField({
    label,
    value,
    onChange,
    type = 'text',
    options = [],
    placeholder = '',
    required = false,
    disabled = false,
    error = '',
    min,
    max,
    step,
}) {
    const baseClasses = `w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium ${error ? 'border-red-500' : 'border-slate-300'
        } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`;

    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {type === 'select' ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseClasses}
                    disabled={disabled}
                    required={required}
                >
                    <option value="">Seçiniz...</option>
                    {options.map((opt) => (
                        <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
                            {typeof opt === 'object' ? opt.label : opt}
                        </option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`${baseClasses} min-h-[100px] resize-y`}
                    disabled={disabled}
                    required={required}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={baseClasses}
                    disabled={disabled}
                    required={required}
                    min={min}
                    max={max}
                    step={step}
                />
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
