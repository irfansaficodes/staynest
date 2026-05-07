import { Check, X } from "lucide-react";
import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const checks = useMemo(() => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains a number", met: /[0-9]/.test(password) },
      { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = checks.filter((c) => c.met).length;
    if (password.length === 0) return { label: "", color: "", score: 0 };
    if (metCount <= 1) return { label: "Very Weak", color: "bg-destructive", score: 1 };
    if (metCount === 2) return { label: "Weak", color: "bg-orange-500", score: 2 };
    if (metCount === 3) return { label: "Fair", color: "bg-warning", score: 3 };
    if (metCount === 4) return { label: "Strong", color: "bg-blue-500", score: 4 };
    return { label: "Very Strong", color: "bg-success", score: 5 };
  }, [checks, password]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Password Strength</span>
        <span className={`text-xs font-semibold ${
          strength.score >= 4 ? "text-success" : strength.score >= 3 ? "text-warning" : "text-destructive"
        }`}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength.score ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>

      <ul className="space-y-1.5">
        {checks.map((check, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            {check.met ? (
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
            )}
            <span className={check.met ? "text-success" : "text-muted-foreground"}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
