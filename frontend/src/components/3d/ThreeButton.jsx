import React from 'react';

export const ThreeButton = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'sage' | 'lavender'
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none outline-none focus-visible:ring-3 focus-visible:ring-[#E9785B]/40';

  const variants = {
    primary:
      'px-6 py-3.5 bg-gradient-to-r from-[#E9785B] via-[#E9785B] to-[#C85C45] text-white text-sm shadow-[0_10px_25px_-5px_rgba(233,120,91,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_35px_-5px_rgba(233,120,91,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] border-t border-white/20',
    secondary:
      'px-6 py-3.5 bg-white/95 backdrop-blur-md border border-[#F6EBDD] text-[#3D2B24] text-sm shadow-[0_6px_20px_-4px_rgba(61,43,36,0.06)] hover:bg-[#FFF8ED] hover:border-[#F5B895] hover:shadow-[0_10px_25px_-4px_rgba(61,43,36,0.1)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98]',
    sage:
      'px-6 py-3.5 bg-gradient-to-r from-[#9DB79B] to-[#7FA07D] text-white text-sm shadow-[0_10px_25px_-5px_rgba(157,183,155,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_35px_-5px_rgba(157,183,155,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] border-t border-white/20',
    lavender:
      'px-6 py-3.5 bg-gradient-to-r from-[#B9A7E8] to-[#8F78C8] text-white text-sm shadow-[0_10px_25px_-5px_rgba(185,167,232,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_35px_-5px_rgba(185,167,232,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] border-t border-white/20',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default ThreeButton;
