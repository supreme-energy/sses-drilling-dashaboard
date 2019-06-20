// These method numbers denote the different sets of variables that calculations are based on.
// The backend stores these method numbers alongside each point.  During recalculation & updates,
// this is used to determine which fields are 'inputs' and which are 'outputs' in the related formulas.
export const LAST_DOGLEG = 0;
export const MD_INC_AZ = 3;
export const MD_SOLVE = 4;
export const INC_SOLVE = 5;
export const TVD_VS = 6;
export const TOT_POS_VS = 7;
export const DIP_FAULT_POS_VS = 8;
