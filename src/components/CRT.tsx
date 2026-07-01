interface CRTProps {
  children: React.ReactNode;
}

function CRT({ children }: CRTProps) {
  return (
    <div className="crt">
      {children}
    </div>
  )
}

export default CRT