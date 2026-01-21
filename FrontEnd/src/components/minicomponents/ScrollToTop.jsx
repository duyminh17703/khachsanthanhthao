import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuộn lên đầu trang mỗi khi đường dẫn (pathname) thay đổi
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;