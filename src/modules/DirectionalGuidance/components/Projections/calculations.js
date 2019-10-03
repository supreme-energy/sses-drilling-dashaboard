import pick from "lodash/pick";
import { PA1 } from "../../../../constants/directionalGuidance";

const PA1_FACTOR = 30;
const PA2_FACTOR = 2;

// p prefix stands for present (survey???), t stands for projection
export function calculateSlide(fieldValues, propAzm, bitProjection, surveyBeforeBit, projections) {
  const paToDelete = [];
  const { azm, inc, motoryield } = fieldValues;
  const { azm: pazm, inc: pinc } = bitProjection;
  const piOver180 = Math.PI / 180;
  let rlfval = 0;
  if (azm - pazm > 180) {
    rlfval = azm - pazm - 360;
  } else if (pazm - azm < -180) {
    rlfval = pazm - azm + 360;
  } else {
    rlfval = pazm - azm;
  }

  const rl = rlfval > 0 ? "R" : "L";
  const v1 =
    Math.sin(piOver180 * pinc) * Math.sin(piOver180 * inc) + Math.cos(piOver180 * pinc) * Math.cos(piOver180 * inc);
  const v2 = Math.cos(piOver180 * Math.abs(pazm - azm));
  const v4 = v1 * v2;
  const v5 = Math.acos(v4) / piOver180;
  const toolFace = Math.acos((inc - pinc) / v5) / piOver180;
  const slide = (v5 / motoryield) * 100;
  let newSlide;

  if (slide !== Infinity) {
    newSlide = {
      ...pick(projections[0], ["tvd", "vs", "ca", "cd", "tot", "dip", "fault"]),
      md: surveyBeforeBit.md + slide,
      tf: toolFace.toFixed(2) + rl
    };

    // TODO: Update Projections based on calculations
    // const updatedProjections = [newSlide, ...projections];
    // projections.map((projection, index) => {
    //   const results = calculateProjection(projection, updatedProjections, index + 1, propAzm);
    // });
  }

  projections.map(projection => {
    const val = projection.vs;
    const currentProjectionId = projection.id;
    if (val < newSlide.vs) {
      if (paToDelete.indexOf(currentProjectionId) === -1) {
        paToDelete.push(currentProjectionId);
      }
    } else {
      if (paToDelete.indexOf(currentProjectionId) !== -1) {
        paToDelete.splice(paToDelete.indexOf(currentProjectionId), 1);
      }
    }
  });

  return { tf: toolFace + rl, pavsdel: paToDelete.join(","), ...newSlide };
}

export function determineIncAzm(firstProjection, secondProjection, bitProjection, selectedStation) {
  let inc = 0;
  let azm = 0;
  if (selectedStation === PA1) {
    inc =
      ((firstProjection.inc - bitProjection.inc) / (firstProjection.md - bitProjection.md)) * PA1_FACTOR +
      bitProjection.inc;
    azm =
      ((firstProjection.azm - bitProjection.azm) / (firstProjection.md - bitProjection.md)) * PA1_FACTOR +
      bitProjection.azm;
  } else {
    inc = (secondProjection.inc - bitProjection.inc) / PA2_FACTOR + bitProjection.inc;
    azm = (secondProjection.azm - bitProjection.azm) / PA2_FACTOR + bitProjection.azm;
  }

  return { inc, azm };
}

export const sortById = (a, b) => a.id - b.id;
