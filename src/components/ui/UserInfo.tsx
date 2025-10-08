import { User } from "@/app/types/user";
import CopyText from "@/components/ui/CopyText";

interface UserInfoProps {
  user: User | null;
}

export const UserInfo = ({ user }: UserInfoProps) => {
  return (
    <div className="bg-card rounded-[20px] p-4 h-[100%] w-[300px]">
      <h2 className="text-[24px] font-bold mb-2">Usuario</h2>
      <div className="space-y-2">
        <div>
          <p className="text-muted-foreground">Nombre completo</p>
          <p className="font-bold text-foreground">{user?.names || "Sin nombre"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Apodo</p>
          <p className="font-bold text-foreground">{user?.wantToBeCalled || "Sin apodo"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Género</p>
          <p className="font-bold text-foreground">{user?.gender || "Sin género"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Nacimiento</p>
          <p className="font-bold text-foreground">
            {user?.birthdate
              ? user?.birthdate.split("T")[0]
              : "Sin nacimiento"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <CopyText
            text={user?.email || "Sin email"}
            className="cursor-pointer flex items-center gap-[5px] font-bold"
            iconClassName="w-[14px] h-[14px]"
            color="text-foreground"
          />
        </div>
        <div>
          <p className="text-muted-foreground">Dispositivo</p>
          <p className="font-bold text-foreground">{user?.device || "Sin dispositivo"}</p>
        </div>
      </div>
    </div>
  );
};
