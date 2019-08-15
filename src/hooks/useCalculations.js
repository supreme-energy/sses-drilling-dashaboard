import { useSurveysDataContainer, useProjectionsDataContainer } from "../modules/App/Containers";

/* PREFIXES: p  = Previous, c = Current, d = Delta (except for dl or dip) */

/* ************** Utility Constants ************** */
const radiansToDegrees = 180.0 / Math.PI;
let degreesToRadians = Math.PI / 180.0;

/* ************** Utility Functions ************** */
function toRadians(aDegrees) {
  return (Math.PI / 180.0) * aDegrees;
}

function toDegrees(a) {
  let b = a * radiansToDegrees;
  if (b < 0.0) b += 360.0;
  return b;
}

// Depth (ft)
export function calcDepth(dip, vs, lastVs, fault, tvd, lastTvd, lastDepth) {
  return tvd - -Math.tan(dip / 57.29578) * Math.abs(vs - lastVs) - fault - (lastTvd - lastDepth);
}

// Major Depth (MD)
export function calcMd(prevSurvey, dTvd, dEw, dNs) {
  // Ex dEw = ew - prevSurvey.ew
  const disp = Math.sqrt(dNs * dNs + dEw * dEw);
  return prevSurvey.depth + Math.sqrt(dTvd * dTvd + disp * disp);
}

// Inclination (Projected)
export function calcInc(disp, deltaTvd, pInc) {
  return 2.0 * Math.atan(disp / deltaTvd) - pInc;
}

// Azimuth
export function calcAzm(deltaEw, deltaNs) {
  // Ex. deltaEw = ew - prevSurvey.ew
  if (deltaNs !== 0.0) {
    return Math.atan2(deltaEw, deltaNs);
  } else if (deltaEw < 0.0) {
    return toRadians(270.0);
  } else {
    return toRadians(90.0);
  }
}

// TOT
export function calcTot(pTot, dip, vs, pVs, fault) {
  let tot = pTot - Math.tan(dip / 57.29578) * Math.abs(vs - pVs);
  tot += fault;
  return tot;
}

// TO-DO: How are these calculated?
// Fault (fetched from DB)
// Dip (fetched from DB)
// Tgt Center Line (TCL)
// PA Position from TCL

/* ************* Survey Method Functions ************* */
function cc(proposedAzm, survey, prevSurveys, values = {}) {
  let ca = 0.0;
  let cd = 0.0;
  let radius = 0.0;
  let { md: pmd, inc: pinc, azm: pazm, tvd: ptvd, ns: pns, ew: pew } = { ...prevSurveys[prevSurveys.length - 1] };
  let { md, inc, azm, tvd, vs, dl } = { ...survey };

  if (md <= pmd) {
    throw new Error(
      "Warning: Measured depth less than the previous survey. Projections will be reordered after saving"
    );
  }

  if (inc > 180.0) inc -= 360.0;
  if (pinc > 180.0) pinc -= 360.0;
  if (azm > 360.0) azm -= 360.0;
  if (pazm > 360.0) pazm -= 360.0;
  if (inc < 0.0 || inc > 180.0) return;
  if (pinc < 0.0 || pinc > 180.0) return;
  inc *= degreesToRadians;
  azm *= degreesToRadians;
  pinc *= degreesToRadians;
  pazm *= degreesToRadians;
  dl = Math.acos(Math.cos(pinc) * Math.cos(inc) + Math.sin(pinc) * Math.sin(inc) * Math.cos(azm - pazm));
  const cl = md - pmd;

  if (dl !== 0.0) {
    radius = (2.0 / dl) * Math.tan(dl / 2.0);
  } else {
    radius = 1.0;
  }

  tvd = ptvd + (cl / 2.0) * (Math.cos(pinc) + Math.cos(inc)) * radius;
  const ns = pns + (cl / 2.0) * (Math.sin(pinc) * Math.cos(pazm) + Math.sin(inc) * Math.cos(azm)) * radius;
  const ew = pew + (cl / 2.0) * (Math.sin(pinc) * Math.sin(pazm) + Math.sin(inc) * Math.sin(azm)) * radius;

  if (ns !== 0) {
    ca = Math.atan2(ew, ns);
  } else {
    ca = Math.PI * Math.PI;
  }
  if (ca !== 0.0) {
    cd = Math.abs(ew / Math.sin(ca));
  } else {
    cd = ns;
  }

  vs = cd * Math.cos(ca - proposedAzm);
  dl = ((dl * 100) / cl) * radiansToDegrees;
  inc = inc * radiansToDegrees;
  azm = azm * radiansToDegrees;
  ca = ca * radiansToDegrees;
  if (ca < 0.0) ca += 360.0;

  return {
    tvd,
    vs,
    ns,
    ew,
    ca,
    cd,
    dl,
    cl,
    ...values
  };
}

function projtia(proposedAzm, survey, prevSurveys) {
  const { md: pmd, tvd: ptvd, inc: pinc } = { ...prevSurveys[prevSurveys.length - 1] };
  const { tvd, inc } = { ...survey };

  const dtvd = tvd - ptvd;
  const svyInc = toRadians(inc);
  const prevSvyInc = toRadians(pinc);
  const md = pmd + (dtvd * (svyInc - prevSvyInc)) / (Math.sin(svyInc) - Math.sin(prevSvyInc));

  cc(proposedAzm, survey, prevSurveys, { md });
}

function projtma(proposedAzm, survey, prevSurveys) {
  let { md: pmd, tvd: ptvd, inc: pinc, azm: pazm } = { ...prevSurveys[prevSurveys.length - 1] };
  let { tvd, azm, md } = { ...survey };
  const dtvd = tvd - ptvd;
  const dmd = md - pmd;

  if (Math.abs(dtvd) > Math.abs(dmd)) {
    throw new Error("Delta TVD is greater than the delta MD");
  }

  azm = toRadians(azm);
  pazm = toRadians(pazm);

  let inc;
  const incr = 0.01;
  for (inc = 0; inc <= 180; inc += incr) {
    if (inc >= pinc - incr && inc <= pinc + incr) {
      continue;
    }

    const dl = Math.acos(
      Math.cos(toRadians(pinc)) * Math.cos(toRadians(inc)) +
        Math.sin(toRadians(pinc)) * Math.sin(toRadians(inc)) * Math.cos(azm - pazm)
    );
    let radius = 0;
    if (dl !== 0.0) {
      radius = (2.0 / dl) * Math.tan(dl / 2.0);
    }

    const a = ptvd + (dmd / 2.0) * (Math.cos(toRadians(pinc)) + Math.cos(toRadians(inc))) * radius;

    if (a <= tvd) {
      break;
    }
  }

  if (inc <= 180.0) {
    cc(proposedAzm, survey, { inc });
  }
}

function projtva(proposedAzm, prevSurveys, survey) {
  const otherInputs = {};

  let { md: pmd, tvd: ptvd, inc: pinc, azm: pazm, bot: pbot, tot: ptot, ew: pew, ns: pns, vs: pvs } = {
    ...prevSurveys[prevSurveys.length - 1]
  };
  let { tvd, azm, vs, tot, pos, dip, fault, method } = {
    ...survey
  };

  if (method === 8 || method === 7 || method === 6) {
    if (method === 8) {
      let tot = ptot + -Math.tan(dip / 57.29578) * Math.abs(vs - pvs);
      let bot = pbot - (ptot - tot);
      tot += fault;
      bot += fault;
      tvd = tot - pos;
      otherInputs.tot = tot;
      otherInputs.bot = bot;
      otherInputs.tvd = tvd;
      otherInputs.dip = dip;
      otherInputs.fault = fault;
    }
    if (method === 7) {
      tvd = tot - pos;
      let bot = pbot + (tot - ptot);

      if (vs - pvs === 0.0) {
        dip = 0.0;
      } else {
        const tdiff = tot - ptot;
        const vdiff = vs - pvs;
        const a = tdiff / vdiff;
        dip = -toDegrees(Math.atan(a));
        if (dip < -180) {
          dip += 360.0;
        }
      }

      otherInputs.tot = tot;
      otherInputs.bot = bot;
      otherInputs.tvd = tvd;
      otherInputs.dip = dip;
      otherInputs.pos = pos;
    }
    let inc = 0;
    let ns = 0;
    let ew = 0;
    let ca = 0;
    let cd = 0;
    let dl = 0;
    let cl = 0;
    let newInc = 0;
    let newvs = 0;
    let newMd = 0;
    let newtvd = 0;
    let radius = 1.0;
    const dtvd = tvd - ptvd;
    const dvs = vs - pvs;
    if (dtvd !== 0.0 || dvs !== 0.0) {
      let incr = 0.01;
      let r = Math.sqrt(dtvd * dtvd + dvs * dvs);
      newMd = pmd + r;
      newInc = 0.0;
      do {
        cl = newMd - pmd;
        if (newInc >= toDegrees(pinc) - incr && newInc <= toDegrees(pinc) + incr) {
          if (newvs < vs && newtvd > tvd) {
            newMd += incr;
            newInc += incr;
          } else if (newvs > vs && newtvd <= tvd) {
            newInc -= incr;
          } else if (newvs > vs && newtvd < tvd) {
            newInc -= incr;
            newMd -= incr;
          }
          continue;
        }
        inc = toRadians(newInc);
        dl = Math.acos(Math.cos(pinc) * Math.cos(inc) + Math.sin(pinc) * Math.sin(inc) * Math.cos(azm - pazm));

        if (dl !== 0.0) {
          radius = (2.0 / dl) * Math.tan(dl / 2.0);
        } else {
          radius = 1.0;
        }

        newtvd = ptvd + (cl / 2.0) * (Math.cos(pinc) + Math.cos(inc)) * radius;
        ns = pns + (cl / 2.0) * (Math.sin(pinc) * Math.cos(pazm) + Math.sin(inc) * Math.cos(azm)) * radius;
        ew = pew + (cl / 2.0) * (Math.sin(pinc) * Math.sin(pazm) + Math.sin(inc) * Math.sin(azm)) * radius;

        if (ns !== 0) {
          ca = Math.atan2(ew, ns);
        } else {
          ca = Math.PI * 0.5 * (ew / Math.abs(ew));
        }

        if (ca !== 0.0) {
          cd = Math.abs(ew / Math.sin(ca));
        } else {
          cd = ns;
        }

        newvs = cd * Math.cos(ca - proposedAzm);

        if (Math.abs(newvs - vs) < 2.0 && Math.abs(newtvd - tvd) < 2.0) {
          incr = 0.001;
        }
        if (newvs < vs && newtvd > tvd) {
          newMd += incr;
          newInc += incr;
        } else if (newvs < vs && newtvd <= tvd) {
          newMd += incr;
        } else if (newvs > vs && newtvd <= tvd) {
          newInc -= incr;
        } else if (newvs >= vs && newtvd > tvd) {
          newMd -= incr;
        } else if (newvs > vs && newtvd < tvd) {
          newInc -= incr;
          newMd -= incr;
        }
      } while ((newtvd > tvd + incr || newvs < vs - incr) && newInc > 0 && newInc <= 180);

      ca *= radiansToDegrees;
      if (ca < 0.0) ca = 180.0 + ca;
      dl = ((dl * 100) / cl) * radiansToDegrees;
      newInc = toDegrees(pinc + (inc - pinc) / 2.0);

      otherInputs.tvd = tvd;
      otherInputs.vs = vs;

      return { newMd, newInc, ns, ew, cd, ca, dl, cl, ...otherInputs };
    }
  }
}

function calcLastDogleg(proposedAzm, surveys, surveyIndex, prevSurveys, project) {
  if (surveyIndex > 1) {
    const { inc: pInc, azm: pAzm, md: pMd } = prevSurveys[surveyIndex - 1];
    let { md } = { ...surveys[surveyIndex] };
    const dmd = md - pMd;
    if (dmd > 0.0) {
      // fetch the previous dl
      const { md: md1, inc: inc1, azm: azm1 } = prevSurveys[surveyIndex - 2];
      const cl = pMd - md1;
      const dinc = (pInc - inc1) / cl;
      const dazm = (pAzm - azm1) / cl;
      const otherValues = {};
      otherValues.svyinc = pInc + dinc * dmd;
      otherValues.svyazm = pAzm + dazm * dmd;

      // Not sure where this is coming from
      if (project !== "ahead") {
        otherValues.bitoffset = dmd;
      }
      cc(proposedAzm, surveys, surveyIndex, otherValues);
    }
  }
}

/* **************** Method Calculations ***************** */
// Caculates
export function useMethodCalculations(projections) {
  // Not sure that this project const is needed anymore
  const project = "ahead";
  let proposedAzm = 0;
  if (proposedAzm > 180) proposedAzm -= 360;
  proposedAzm *= degreesToRadians;

  if (!projections) return [];

  return projections.reduce((acc, survey, index) => {
    let result;
    switch (survey.method) {
      case "0":
        // last dogleg
        result = calcLastDogleg(proposedAzm, survey, index, acc, project);
        break;
      case "1":
        // baker inc and az projections (not used)
        break;
      case "2":
        // baker inc and az projections (not used)
        break;
      case "3":
        // Input MD/INC/AZ
        result = cc(proposedAzm, acc);
        break;
      case "4":
        // Solve for MD
        result = projtia(proposedAzm, survey, acc);
        break;
      case "5":
        // Solve for inc
        result = projtma(proposedAzm, survey, acc);
        break;
      case "6":
        // Input TVD/VS
        result = projtva(proposedAzm, acc, survey);
        break;
      case "7":
        // Input TOT/POS/VS
        result = projtva(proposedAzm, acc, survey);
        break;
      case "8":
        // Input DIP/FAULT/POS/VS
        result = projtva(proposedAzm, acc, survey);
        break;
    }
    // Merge survey with result
    acc.push({ ...survey, ...result });
    return acc;
  }, []);
}

export function useFormationCalculations(pTot, dip, vs, pVs, fault, thickness) {
  // Dip and fault are from surveys
  // Everything else is from formations
  let tot = calcTot(pTot, dip, vs, pVs, fault);
  tot += thickness;
  return tot;
}
