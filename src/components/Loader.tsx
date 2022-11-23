import Image from "next/image";

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col grow items-center justify-center gap-2">
      <div className="relative h-10 w-10 animate-spin">
        <Image src="/logo.svg" alt="logo" layout="fill" />
      </div>
      <p className="text-3xl">{text}</p>
    </div>
  );
};

export default Loader;
