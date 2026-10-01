import React from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SurveyPopup: React.FC<Props> = ({ visible, onClose }) => {
  const navigate = useNavigate();

  const startSurvey = () => {
    onClose();
    navigate("/survey");
  };

  return (
    <Modal isOpen={visible} onClose={onClose} maxWidth="md">
      <div className="text-center py-4 px-2 space-y-5">
        <div className="w-16 h-16 rounded-full bg-surfaceDark border-2 border-primary mx-auto flex items-center justify-center text-primary shadow-lg shadow-amber-500/20">
          <Sparkles size={32} className="text-primary fill-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Discover Your Perfect Style
          </h2>
          <p className="text-sm text-textSecondary max-w-sm mx-auto leading-relaxed">
            Complete our 5-step hair diagnostic survey to calibrate custom AI hairstyle and cut recommendations tailored to your face geometry.
          </p>
        </div>

        <div className="pt-3 space-y-2.5">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base font-black"
            onClick={startSurvey}
          >
            START SURVEY NOW
          </Button>

          <Button
            variant="ghost"
            size="md"
            className="w-full text-textMuted hover:text-white"
            onClick={onClose}
          >
            I'LL DO THIS LATER
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SurveyPopup;
