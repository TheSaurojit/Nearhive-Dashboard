import React from "react";
import AddImages from "@/components/campaigns/addImages";
import CampaignHead from "@/components/campaigns/campaignHead";
import ResetCampaign from "@/components/campaigns/resetCampaign";

function Campaigns() {
  return (
    <div className="font-main space-y-6">
      <div className="flex justify-between items-center ">
        <AddImages />
        <ResetCampaign />
      </div>

      <CampaignHead />
    </div>
  );
}

export default Campaigns;
