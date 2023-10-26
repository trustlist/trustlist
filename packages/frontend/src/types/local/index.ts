import { TrustScoreKeyEnum } from "@/data";

export type TrustScoreKey = keyof typeof TrustScoreKeyEnum;

export type TrustScoreInfo = {
    title: string
    description: string
    score: number | undefined
}