
import "./globals.css";
export default function RootLayout({ children }){
  return (
    <html>
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  )
}
