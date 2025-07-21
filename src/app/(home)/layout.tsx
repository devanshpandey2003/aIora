import { Navbar } from "@/modules/home/ui/components/navbar";
interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <main className="flex flex-col min-h-screen">
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)] 
                       bg-[radial-gradient(#dadde2_1px,transparent_1px)] [background-size:16px_16px]"
      />
      <div className="flex flex-1 flex-col px-6 py-4">
        <Navbar />
        {children}
      </div>
    </main>
  );
};

export default Layout;
