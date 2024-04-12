import { Nav, NavLink } from "@/components/nav";
import { menuLinks } from "@/lib/customer-menu-links";

export const dynamic = "force-dynamic";

export default function PublicLayout({
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
