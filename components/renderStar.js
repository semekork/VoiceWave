import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";


const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={12} color={colors.warning} />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={12}
          color={colors.warning}
        />
      );
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={12}
          color={colors.warning}
        />
      );
    }
    return stars;
  };

  export default renderStars