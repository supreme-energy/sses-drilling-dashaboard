/* PREFIXES: p  = Previous, c = Current, d = Delta (except for dl or dip) */

/* ************** Utility Constants ************** */
import {
  DIP_FAULT_POS_VS,
  INC_SOLVE,
  LAST_DOGLEG,
  MD_INC_AZ,
  MD_SOLVE,
  TOT_POS_VS,
  TVD_VS
} from "../constants/calcMethods";

const radiansToDegrees = 180.0 / Math.PI;
let degreesToRadians = Math.PI / 180.0;

/* ************** Utility Functions ************** */
function toRadians(aDegrees) {
  if (aDegrees > 180.0) return (aDegrees - 360.0) * degreesToRadians;
  return degreesToRadians * aDegrees;
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
function cc(proposedAzm, projection, prevProjection, values = {}) {
  let ca = 0.0;
  let cd = 0.0;
  let radius = 0.0;
  let { md: pmd, inc: pinc, azm: pazm, tvd: ptvd, ns: pns, ew: pew } = { ...prevProjection };
  let { md, inc, azm, tvd, vs, dl } = { ...projection };

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
    ...projection,
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

function projtia(proposedAzm, projection, prevProjection) {
  const { md: pmd, tvd: ptvd, inc: pinc } = { ...prevProjection };
  const { tvd, inc } = { ...projection };

  const dtvd = tvd - ptvd;
  const svyInc = toRadians(inc);
  const prevSvyInc = toRadians(pinc);
  const md = pmd + (dtvd * (svyInc - prevSvyInc)) / (Math.sin(svyInc) - Math.sin(prevSvyInc));

  return cc(proposedAzm, projection, prevProjection, { md });
}

function projtma(proposedAzm, projection, prevProjection) {
  let { md: pmd, tvd: ptvd, inc: pinc, azm: pazm } = { ...prevProjection };
  let { tvd, azm, md } = { ...projection };
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

  if (inc > 180.0) {
    // TODO: How should calculations be handled if the inclination is out of range?
    //  https://experoinc.atlassian.net/browse/DD-286
  }
  return cc(proposedAzm, projection, prevProjection, { inc });
}

function projtva(proposedAzm, projection, prevProjection) {
  const otherInputs = {};

  let { md: pmd, tvd: ptvd, inc: pinc, azm: pazm, bot: pbot, tot: ptot, tcl: ptcl, ew: pew, ns: pns, vs: pvs } = {
    ...prevProjection
  };
  pinc = toRadians(pinc);
  pazm = toRadians(pazm);
  let { tvd, azm, vs, tcl, pos, dip, fault, method } = {
    ...projection
  };
  azm = toRadians(azm);

  if (method === 8 || method === 7 || method === 6) {
    if (method === 8) {
      let tcl = ptcl + -Math.tan(dip / 57.29578) * Math.abs(vs - pvs);
      let tot = ptot - (ptcl - tcl);
      let bot = pbot - (ptcl - tcl);
      tcl += fault;
      bot += fault;
      tvd = tcl - pos;
      otherInputs.tcl = tcl;
      otherInputs.tot = tot;
      otherInputs.bot = bot;
      otherInputs.tvd = tvd;
      otherInputs.dip = dip;
      otherInputs.fault = fault;
    }
    if (method === 7) {
      tvd = tcl - pos;
      let tot = ptot + (tcl - ptcl);
      let bot = pbot + (tcl - ptcl);

      if (vs - pvs === 0.0) {
        dip = 0.0;
      } else {
        const tdiff = tcl - ptcl;
        const vdiff = vs - pvs;
        const a = tdiff / vdiff;
        dip = -toDegrees(Math.atan(a));
        if (dip < -180) {
          dip += 360.0;
        }
      }

      otherInputs.tcl = tcl;
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
      let incr = 0.1;
      let r = Math.sqrt(dtvd * dtvd + dvs * dvs);
      newMd = pmd + r;
      // TODO: Performance issue -- See if we can calculate inc, md, etc directly instead of guessing hundreds of times
      //  The server calculations loop thousands of times to find inc & md, but there should be a better way
      //  Original C and JS versions found on the SSES github here:
      //  https://github.com/supreme-energy/sses-main/blob/master/sses_cc/calccurve.c#L281
      //  https://github.com/supreme-energy/sses-main/blob/color_and_logo_change/web/projws.php#L836
      // Make a better guess at the newInc than "0"
      newInc = toDegrees(Math.atan2(vs - pvs, dtvd)) - 10;
      let counter = 0;
      do {
        counter++;
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

        if (Math.abs(newvs - vs) < 2 && Math.abs(newtvd - tvd) < 2) {
          incr = 0.01;
        }
        if (Math.abs(newvs - vs) < 0.02 && Math.abs(newtvd - tvd) < 0.02) {
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
      } while ((newtvd > tvd + incr || newvs < vs - incr) && newInc > 0 && newInc <= 180 && counter < 2000);

      ca *= radiansToDegrees;
      if (ca < 0.0) ca = 180.0 + ca;
      dl = ((dl * 100) / cl) * radiansToDegrees;
      newInc = toDegrees(pinc + (inc - pinc) / 2.0);
      otherInputs.tvd = tvd;
      otherInputs.vs = vs;

      return { ...projection, md: newMd, inc: newInc, ns, ew, cd, ca, dl, cl, ...otherInputs };
    } else {
      return projection;
    }
  }
}

function calcLastDogleg(proposedAzm, projection, projections, index) {
  const prevSurvey = projections[index - 1];
  const secondPrevSurvey = projections[index - 2];

  const { inc: pInc, azm: pAzm, md: pMd } = prevSurvey;
  const { md } = { ...projection };
  const dmd = md - pMd;
  if (dmd > 0.0 || !secondPrevSurvey) {
    // fetch the previous dl
    const { md: md1, inc: inc1, azm: azm1 } = secondPrevSurvey;
    const cl = pMd - md1;
    const dinc = (pInc - inc1) / cl;
    const dazm = (pAzm - azm1) / cl;
    const otherValues = {};
    otherValues.svyinc = pInc + dinc * dmd;
    otherValues.svyazm = pAzm + dazm * dmd;
    otherValues.bitoffset = dmd;

    return cc(proposedAzm, projection, prevSurvey, otherValues);
  } else {
    return projection;
  }
}

/* **************** Method Calculations ***************** */
export function calculateProjection(projection, projections, index, proposedAzm) {
  if (proposedAzm > 180) proposedAzm -= 360;
  proposedAzm *= degreesToRadians;

  if (!projections) return projection;

  switch (projection.method) {
    case LAST_DOGLEG:
      return calcLastDogleg(proposedAzm, projection, projections, index);
    case MD_INC_AZ:
      return cc(proposedAzm, projection, projections[index - 1]);
    case MD_SOLVE:
      return projtia(proposedAzm, projection, projections[index - 1]);
    case INC_SOLVE:
      return projtma(proposedAzm, projection, projections[index - 1]);
    case TVD_VS:
      return projtva(proposedAzm, projection, projections[index - 1]);
    case TOT_POS_VS:
      return projtva(proposedAzm, projection, projections[index - 1]);
    case DIP_FAULT_POS_VS:
      return projtva(proposedAzm, projection, projections[index - 1]);
  }
}

export function useFormationCalculations(pTot, dip, vs, pVs, fault, thickness) {
  // Dip and fault are from surveys
  // Everything else is from formations
  let tot = calcTot(pTot, dip, vs, pVs, fault);
  tot += thickness;
  return tot;
}
