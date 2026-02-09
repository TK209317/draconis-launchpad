export const BackgroundDecorator = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="relative w-full h-full ">
        <div
          id="background-decorator-1"
          className="absolute -left-20 top-72 w-[575px] h-[205px] rotate-[-133.10deg] bg-gradient-to-b blur-[80px] from-black to-[#6E09DD] "
        />

        <div
          className="absolute right-10 top-1/4 w-full h-[180px] pointer-events-none"
          style={{
            opacity: 0.88,
            filter: "blur(97px)",
            background:
              "linear-gradient(180deg, rgba(21, 88, 189, 0.80) 0%, rgba(131, 182, 230, 0.80) 100%)",
            borderRadius: "100px",
          }}
        />

        <div
          className="absolute left-1/4 top-10 w-[758px] h-[758px] opacity-30 pointer-events-none"
          style={{
            borderRadius: "758px",
            background:
              "radial-gradient(50% 50% at 50% 50%, #6E09DD 0%, rgba(37, 208, 239, 0.00) 100%)",
          }}
        />

        <div
          className="absolute left-[200px] top-1/2 pointer-events-none !blur-3xl"
          style={{
            width: "554px",
            height: "554px",
            borderRadius: "493.112px",
            opacity: 0.3,
            background:
              "radial-gradient(50% 50% at 50% 50%, #2E43B5 0%, #25D0EF 100%)",
            filter: "blur(47px)",
            transform: "translate(-50%, -50%)",
          }}
        />

        <div
          className="absolute left-[50%] top-[250vh] pointer-events-none"
          style={{
            width: "90vw",
            height: "90vh",
            borderRadius: "493.112px",
            opacity: 0.1,
            background:
              "radial-gradient(50% 50% at 50% 50%, #2E43B5 0%, #25D0EF 100%)",
            filter: "blur(47px)",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Bottom blurred bar gradient background (CSS, not SVG) */}
        <div
          className="absolute left-0 bottom-10 w-full h-[344px] pointer-events-non blur-[100px]"
          style={{
            opacity: 0.4,
            filter: "blur(97px)",
            background: "linear-gradient(180deg, #25D0EF 0%, #6E09DD 100%)",
          }}
        />
      </div>
    </div>
  );
};
