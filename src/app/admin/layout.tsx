import { Nav, NavLink } from "@/components/nav";
import { menuLinks } from "@/lib/admin-menu-links";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav>
        {menuLinks.map((link, index) => (
          <NavLink key={index} href={link.href}>
            {link.name}
          </NavLink>
        ))}
      </Nav>
      <div className='container my-6'>{children}</div>
    </>
  );
}
