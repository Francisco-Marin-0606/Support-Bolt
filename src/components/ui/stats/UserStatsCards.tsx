"use client";
import { textStyles } from "@/app/styles/themes";
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  valueColor = "text-foreground",
}) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-strong">
      <h3 className={`${textStyles.body} text-muted-foreground mb-1`}>{title}</h3>
      <p className={`${textStyles.display3} ${valueColor}`}>{value}</p>
    </div>
  );
};

interface UserStatsCardsProps {
  totalUsers: number;
  activeUsers: number;
  canceledUsers: number;
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({
  totalUsers,
  activeUsers,
  canceledUsers,
}) => {
  // Función para formatear números con separadores de miles
  const formatNumber = (num: number): string => {
    return num.toLocaleString("es-ES");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <StatCard title="Todos" value={formatNumber(totalUsers)} />
      <StatCard
        title="Activos"
        value={formatNumber(activeUsers)}
        valueColor="text-[#188554]"
      />
      <StatCard
        title="Cancelados"
        value={formatNumber(canceledUsers)}
        valueColor="text-muted-foreground"
      />
    </div>
  );
};

export default UserStatsCards;
